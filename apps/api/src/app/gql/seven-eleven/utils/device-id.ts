export function getDeviceId() {
  const availableCharacters = '0123456789abcdef';
  const len = 16;
  const idArray = [];
  for (let i = 0; i < len; i++) {
    const randomIdx = Math.floor(Math.random() * len);
    idArray.push(availableCharacters[randomIdx]);
  }
  const deviceId = idArray.join('');
  return deviceId;
}
