/**
 * @param {number=} timeout
 * @returns {Promise<void>} 
 */
export async function aTimeout(timeout=0) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}
