import assert from "node:assert/strict"
import { test } from "node:test"

let moduleId = 0

async function setup(t, { stored = [], top = 0, storageThrows = false } = {}) {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window")
  const previousDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document"
  )
  const storage = new Map([["scroll-positions", JSON.stringify(stored)]])
  const calls = []
  const headings = new Map()
  const window = Object.assign(new EventTarget(), {
    scrollY: top,
    maxTop: Infinity,
    sessionStorage: {
      getItem(key) {
        if (storageThrows) throw new Error("Storage unavailable")
        return storage.get(key) ?? null
      },
      setItem(key, value) {
        if (storageThrows) throw new Error("Storage unavailable")
        storage.set(key, value)
      },
    },
    scrollTo(options) {
      calls.push(options)
      this.scrollY = Math.min(this.maxTop, options.top)
    },
  })

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: window,
  })
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { getElementById: (id) => headings.get(id) ?? null },
  })

  const controllers = []
  t.after(() => {
    controllers.forEach((controller) => controller.dispose())
    if (previousWindow) {
      Object.defineProperty(globalThis, "window", previousWindow)
    } else {
      delete globalThis.window
    }
    if (previousDocument) {
      Object.defineProperty(globalThis, "document", previousDocument)
    } else {
      delete globalThis.document
    }
  })

  const { createScrollRestoration } = await import(
    `../src/lib/scroll-restoration.ts?test=${moduleId++}`
  )

  return {
    window,
    calls,
    storage,
    create(options) {
      const controller = createScrollRestoration({
        hash: "",
        restorePosition: false,
        ...options,
      })
      controllers.push(controller)
      return controller
    },
    scroll(top) {
      window.scrollY = top
      window.dispatchEvent(new Event("scroll"))
    },
    heading(id, top) {
      headings.set(id, {
        scrollIntoView(options) {
          calls.push({ id, ...options })
          window.scrollY = top
        },
      })
    },
  }
}

test("new navigation starts at the top and late readiness does not reset user scrolling", async (t) => {
  const env = await setup(t, { top: 1500 })
  const page = env.create({ key: "about" })
  assert.equal(env.window.scrollY, 0)
  env.scroll(300)
  page.ready()
  assert.equal(env.window.scrollY, 300)
})

test("back navigation waits until content can accommodate the saved position", async (t) => {
  const env = await setup(t, { stored: [["archive", 1500]] })
  env.window.maxTop = 100
  const page = env.create({ key: "archive", restorePosition: true })
  assert.equal(env.calls.length, 0)
  env.window.maxTop = 3000
  page.ready()
  assert.equal(env.window.scrollY, 1500)
})

test("the same path's different history entries retain independent positions", async (t) => {
  const env = await setup(t)
  const first = env.create({ key: "archive-first" })
  env.scroll(1500)
  first.dispose()
  const second = env.create({ key: "archive-second" })
  env.scroll(700)
  second.dispose()
  const back = env.create({ key: "archive-first", restorePosition: true })
  back.ready()
  assert.equal(env.window.scrollY, 1500)
  back.dispose()
  const forward = env.create({ key: "archive-second", restorePosition: true })
  forward.ready()
  assert.equal(env.window.scrollY, 700)
})

test("cleanup preserves the last reading position when the next page shortens the document", async (t) => {
  const env = await setup(t)
  const page = env.create({ key: "archive" })
  env.scroll(1600)
  env.window.scrollY = 0
  page.dispose()
  const back = env.create({ key: "archive", restorePosition: true })
  back.ready()
  assert.equal(env.window.scrollY, 1600)
})

test("encoded anchors wait for Markdown to render", async (t) => {
  const env = await setup(t)
  const page = env.create({ key: "post", hash: "#%E6%A0%87%E9%A2%98" })
  assert.equal(env.calls.length, 0)
  env.heading("\u6807\u9898", 900)
  page.ready()
  assert.equal(env.window.scrollY, 900)
  assert.equal(env.calls[0].id, "\u6807\u9898")
})

test("back navigation restores reading position ahead of an old TOC anchor", async (t) => {
  const env = await setup(t, { stored: [["post", 1800]] })
  env.heading("intro", 300)
  const page = env.create({
    key: "post",
    hash: "#intro",
    restorePosition: true,
  })
  page.ready()
  assert.equal(env.window.scrollY, 1800)
  assert.equal(env.calls.length, 1)
})

test("malformed and missing anchors safely fall back to the top", async (t) => {
  const env = await setup(t, { top: 400 })
  env.create({ key: "invalid", hash: "#%ZZ" }).ready()
  assert.equal(env.window.scrollY, 0)
  env.scroll(500)
  env.create({ key: "missing", hash: "#missing" }).ready()
  assert.equal(env.window.scrollY, 0)
})

for (const interaction of ["wheel", "touchstart", "pointerdown"]) {
  test(`${interaction} cancels delayed restoration`, async (t) => {
    const env = await setup(t, { stored: [["post", 1800]] })
    const page = env.create({ key: "post", restorePosition: true })
    env.window.dispatchEvent(new Event(interaction))
    env.scroll(200)
    page.ready()
    assert.equal(env.window.scrollY, 200)
  })
}

test("scroll keys interrupt restoration, while ordinary typing does not", async (t) => {
  const env = await setup(t, { stored: [["post", 1800]] })
  const page = env.create({ key: "post", restorePosition: true })
  env.window.dispatchEvent(Object.assign(new Event("keydown"), { key: "a" }))
  page.ready()
  assert.equal(env.window.scrollY, 1800)
  page.dispose()
  const next = env.create({ key: "post", restorePosition: true })
  env.window.dispatchEvent(
    Object.assign(new Event("keydown"), { key: "PageDown" })
  )
  env.scroll(300)
  next.ready()
  assert.equal(env.window.scrollY, 300)
})

test("pagehide saves the current offset and preserves pending targets", async (t) => {
  const env = await setup(t, { stored: [["archive", 1500]] })
  const page = env.create({ key: "archive", restorePosition: true })
  env.window.dispatchEvent(new Event("pagehide"))
  assert.deepEqual(JSON.parse(env.storage.get("scroll-positions")), [
    ["archive", 1500],
  ])
  page.ready()
  env.window.scrollY = 1900
  env.window.dispatchEvent(new Event("pagehide"))
  assert.deepEqual(JSON.parse(env.storage.get("scroll-positions")), [
    ["archive", 1900],
  ])
})

test("leaving an unrendered anchor does not replace it with a saved zero offset", async (t) => {
  const env = await setup(t)
  env.create({ key: "post", hash: "#intro" }).dispose()
  const page = env.create({
    key: "post",
    hash: "#intro",
    restorePosition: true,
  })
  env.heading("intro", 700)
  page.ready()
  assert.equal(env.window.scrollY, 700)
})

test("disposed controllers cannot move the next page or keep listening", async (t) => {
  const env = await setup(t, { stored: [["archive", 1500]] })
  const page = env.create({ key: "archive", restorePosition: true })
  page.dispose()
  env.scroll(400)
  page.ready()
  assert.equal(env.window.scrollY, 400)
  const back = env.create({ key: "archive", restorePosition: true })
  back.ready()
  assert.equal(env.window.scrollY, 1500)
})

test("storage failures leave in-memory back navigation functional", async (t) => {
  const env = await setup(t, { storageThrows: true })
  const first = env.create({ key: "archive" })
  env.scroll(1200)
  first.dispose()
  const back = env.create({ key: "archive", restorePosition: true })
  back.ready()
  assert.equal(env.window.scrollY, 1200)
})
