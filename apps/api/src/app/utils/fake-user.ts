import faker from 'faker';

function getPhoneNumber() {
  const phoneNumber = faker.phone.phoneNumberFormat();
  const phoneArr = phoneNumber.replace(/ /g, '').split('');
  phoneArr.splice(1, 1, '4');
  return phoneArr.join('');
}

export function getFakeUser() {
  const emailDomains = ['@1secmail.net', '@1secmail.com', '@1secmail.org'];
  const randomIdx = Math.floor(Math.random() * 3);

  faker.locale = 'en_AU';

  const email = `${faker.internet.userName()}${emailDomains[randomIdx]}`;
  const password = faker.internet.password();

  return {
    email,
    password,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: getPhoneNumber(),
    dob: faker.date.between(new Date(1980, 1, 1), new Date(1995, 1, 1)),
  };
}
