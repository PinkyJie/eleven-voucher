import faker from 'faker';
import passwordGenerator from 'generate-password';

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
  // password must include numbers/lowercase/uppercase, otherwise HTTP 412 returns
  const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  let password = '';
  while (!password.match(passwordRegEx)) {
    password = passwordGenerator.generate({
      length: 10,
      numbers: true,
      lowercase: true,
      uppercase: true,
    });
  }

  return {
    email,
    password,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    phone: getPhoneNumber(),
    dob: faker.date.between(new Date(1980, 1, 1), new Date(1995, 1, 1)),
  };
}
