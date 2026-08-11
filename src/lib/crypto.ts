import JSEncrypt from "jsencrypt"

/**
 * 使用 PEM 公钥对明文进行 RSA PKCS1v15 加密
 * @param publicKey
 * @param plainText
 */
export function encryptWithPublicKey(
  publicKey: string,
  plainText: string
): string {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey)

  const encrypted = encryptor.encrypt(plainText)

  if (!encrypted) {
    throw new Error("Failed to encrypt text with public key")
  }
  return encrypted
}
