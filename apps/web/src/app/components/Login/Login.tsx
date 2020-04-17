import React, { useCallback, useState, useContext } from 'react';
import { Form, Segment, Button, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import { firebaseAuth } from '../../../utils/firebase';
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
        setLoginError(false);
        setLoading(true);
        try {
          await firebaseAuth.signInWithEmailAndPassword(
            email.value,
            password.value
          );
          const token = await firebaseAuth.currentUser.getIdToken();
          setToken(token);
          setLoading(false);
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
      <Form onSubmit={handleLogin} size="large">
        <Segment stacked>
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
          <Button
            type="submit"
            color="teal"
            fluid
            size="large"
            loading={loading}
          >
            Login
          </Button>
        </Segment>
      </Form>
      <Message>
        New to us? &nbsp; <Link to="/signup">Sign Up</Link>
      </Message>
    </>
  );
};
