import React, { useCallback, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Form, Segment, Button, Message } from 'semantic-ui-react';

import { loginAndGetToken } from '../../../utils/auth';
import { Routes } from '../../../utils/constants';
import { firebaseAnalytics } from '../../../utils/firebase';
import { SessionContext } from '../../context';

export const Login = () => {
  const [loginError, setLoginError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setToken } = useContext(SessionContext);

  const handleLogin = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { email, password } = event.currentTarget.elements as any;
      const emailRe = /\S+@\S+\.\S+/;
      if (email.value && password.value && emailRe.exec(email.value)) {
        firebaseAnalytics.logEvent('login', {
          email: email.value,
        });
        setLoginError(false);
        setLoading(true);
        try {
          const token = await loginAndGetToken(email.value, password.value);
          setToken(token);
        } catch (e) {
          console.error(e);
          setLoginError(true);
          setLoading(false);
        }
      }
    },
    [setToken]
  );

  return (
    <>
      <Form onSubmit={handleLogin} size="large" loading={loading}>
        <Segment attached>
          {loginError && (
            <Message negative>
              <p>Your email/password is not correct!</p>
            </Message>
          )}
          <Form.Input
            name="email"
            icon="user"
            iconPosition="left"
            placeholder="E-mail address"
            fluid
          />
          <Form.Input
            name="password"
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            type="password"
            fluid
          />
          <Button type="submit" color="teal" fluid size="large">
            Login
          </Button>
        </Segment>
      </Form>
      <Message attached="bottom" warning>
        New to us? &nbsp; <Link to={Routes.Signup}>Sign Up</Link> &nbsp; first.
      </Message>
    </>
  );
};
