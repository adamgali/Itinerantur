/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './auth';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM ELEMENTS

const DOMstrings = {
  mapBox: document.getElementById('map'),
  loginForm: document.querySelector('.login-form'),
  signupForm: document.querySelector('.signup-form'),
  logOutBtn: document.querySelector('.nav__el--logout'),
  userDataForm: document.querySelector('.form-user-data'),
  userPasswordForm: document.querySelector('.form-user-password'),
  bookBtn: document.getElementById('book-tour'),
  popUp: document.querySelector('.pop_up'),
  popupClose: document.getElementById('pop_up-close'),
  inputLoginEmail: document.querySelector('.login_email_validation'),
  emailLoginErrorMsg: document.querySelector('.login_email_err_msg'),
  inputLoginPassword: document.querySelector('.login_password_validation'),
  passwordLoginErrorMsg: document.querySelector('.password_login_err_msg'),
  inputFirstName: document.querySelector('.firstName_validation'),
  firstnameErrorMsg: document.querySelector('.firstName_err-msg'),
  inputLastName: document.querySelector('.lastName_validation'),
  lastNameErrorMsg: document.querySelector('.lastName-_err_msg'),
  inputSignupEmail: document.querySelector('.signup_email_validation'),
  emailSignupErrorMsg: document.querySelector('.signup_email_err_msg'),
  inputSignupPassword: document.querySelector('.signup_password_validation'),
  passwordSignupErrorMsg: document.querySelector('.password_signup_err_msg'),
  inputSignupPasswordConfrm: document.querySelector(
    '.password_confrm_validation'
  ),
  passwordSignupConfrmErrorMsg: document.querySelector(
    '.password_signup_confrm_err_msg'
  ),
};

function Auth(input, err_msg, regex, txt1, txt2) {
  this.input = input;
  this.err_msg = err_msg;
  this.regex = regex;
  this.txt1 = txt1;
  this.txt2 = txt2;

  if (input)
    document.addEventListener(
      'invalid',
      (() => {
        return (e) => {
          e.preventDefault();
          input.focus();
        };
      })(),
      true
    );
  input.oninvalid = (event) => {
    if (event.target.value == '') {
      err_msg.innerHTML = txt1;
      input.style.border = '0.1rem solid #FF5656';
    } else if (event.target.value.search(regex)) {
      err_msg.innerHTML = txt2;
      input.style.border = '0.1rem solid #FF5656';
    } else {
      input.style.border = '0.1rem solid #caced0';
    }
  };
  input.oninput = (event) => {
    if (event.target.value !== '') {
      input.style.border = '0.1rem solid #caced0';
      err_msg.innerHTML = '';
    } else if (event.target.value !== regex) {
      input.style.border = '0.1rem solid #FF5656';
      err_msg.innerHTML = '';
    }
  };
}

// DELEGATION
if (DOMstrings.mapBox) {
  const locations = JSON.parse(DOMstrings.mapBox.dataset.locations);
  displayMap(locations);
}

if (DOMstrings.loginForm)
  DOMstrings.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (DOMstrings.signupForm)
  DOMstrings.signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(firstName, lastName, email, password, passwordConfirm);
  });

if (window.location.href === 'http://localhost:3000/login') {
  const loginEmail = new Auth(
    DOMstrings.inputLoginEmail,
    DOMstrings.emailLoginErrorMsg,
    /\S+@\S+\.\S+/,
    'Please enter your email here.',
    'Please enter a valid email here.'
  );
  const loginPassword = new Auth(
    DOMstrings.inputLoginPassword,
    DOMstrings.passwordLoginErrorMsg,
    /\S+[a-zA-Z]{2,8}\S+\.\S+/,
    'Please enter your password here',
    'Your password must be at least 8 characters long'
  );
  loginEmail();
  loginPassword();
} else if (window.location.href === 'http://localhost:3000/signup') {
  const signUpFrstName = new Auth(
    DOMstrings.inputFirstName,
    DOMstrings.firstnameErrorMsg,
    /\S+[a-zA-Z]{3,}/,
    'Please enter your first name here',
    'Please enter a valid first name'
  );
  const signupLastName = new Auth(
    DOMstrings.inputLastName,
    DOMstrings.lastNameErrorMsg,
    /^\w{1,10}$/,
    'Please enter your last name here',
    'Please enter a valid last name'
  );
  const signupEmail = new Auth(
    DOMstrings.inputSignupEmail,
    DOMstrings.emailSignupErrorMsg,
    /\S+@\S+\.\S+/,
    'Please enter your email here',
    'Please enter a valid email'
  );
  const signupPassword = new Auth(
    DOMstrings.inputSignupPassword,
    DOMstrings.passwordSignupErrorMsg,
    /^[a-zA-Z]{8,}$/,
    'Please enter your password here',
    'Passwords must be at least 8 characters'
  );
  const signupPasswordConfrm = new Auth(
    DOMstrings.inputSignupPasswordConfrm,
    DOMstrings.passwordSignupConfrmErrorMsg,
    /^[a-zA-Z]{8,}$/,
    "Your passwords don't match.",
    ''
  );
  signUpFrstName();
  signupLastName();
  signupEmail();
  signupPassword();
  signupPasswordConfrm();
}

if (DOMstrings.logOutBtn)
  DOMstrings.logOutBtn.addEventListener('click', logout);

if (DOMstrings.userDataForm)
  DOMstrings.userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (DOMstrings.userPasswordForm)
  DOMstrings.userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (DOMstrings.bookBtn)
  DOMstrings.bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

window.onload = () => {
  if (!sessionStorage.getItem('firstVisit')) {
    sessionStorage.setItem('firstVisit', '1');
  } else {
    sessionStorage.setItem('firstVisit', '0');
  }
  (function () {
    if (sessionStorage.getItem('firstVisit') === '1') {
      DOMstrings.popUp.style.display = 'inline';
      DOMstrings.popupClose.addEventListener('click', (e) => {
        e.preventDefault();
        DOMstrings.popUp.style.display = 'none';
      });
    }
  })();
};

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
