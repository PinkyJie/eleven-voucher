import React, { useContext, useCallback, useEffect, useState } from 'react';
import { Form, Segment, Button, Message } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';

import { extractGraphqlErrorMessage } from '../../../utils/error';
import { firebaseAuth } from '../../../utils/firebase';
import {
  SignupMutation,
  SignupMutationVariables,
} from '../../../generated/generated';
import { SessionContext } from '../../context';
import { Routes } from '../../../utils/constants';

import SIGNUP_MUTATION from './Signup.graphql';

export const Signup = () => {
  const { setToken } = useContext(SessionContext);
  const [credential, setCredential] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [signup, { data, loading, error }] = useMutation<
    SignupMutation,
    SignupMutationVariables
  >(SIGNUP_MUTATION);

  const handleSignup = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      const { email, password, invitationCode } = event.currentTarget
        .elements as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      const emailRe = /\S+@\S+\.\S+/;
      if (
        email.value &&
        password.value &&
        invitationCode.value &&
        emailRe.exec(email.value)
      ) {
        setCredential({
          email: email.value,
          password: password.value,
        });
        signup({
          variables: {
            email: email.value,
            password: password.value,
            invitationCode: invitationCode.value,
          },
        });
      }
    },
    [setCredential, signup]
  );

  useEffect(() => {
    async function loginAndSetToken() {
      await firebaseAuth.signInWithEmailAndPassword(
        credential.email,
        credential.password
      );
      const token = await firebaseAuth.currentUser.getIdToken(true);
      setToken(token);
    }
    if (data?.signup?.uid && credential.email && credential.password) {
      loginAndSetToken();
    }
  }, [data, setToken, credential]);

  return (
    <>
      <Message attached info>
        We are still in beta now, &nbsp;
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://eleven-voucher.typeform.com/to/Ooi5qA"
        >
          <b>CLICK HERE</b>
        </a>
        &nbsp; to get an invitation code.
      </Message>
      <Form onSubmit={handleSignup} size="large" loading={loading}>
        <Segment attached>
          {error && (
            <Message negative>
              <p>{extractGraphqlErrorMessage(error)}</p>
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
          <Form.Input
            name="invitationCode"
            icon="slack"
            iconPosition="left"
            placeholder="Invitation code"
            autoComplete="off"
            fluid
          />
          <Button type="submit" color="teal" fluid size="large">
            Sign up
          </Button>
        </Segment>
      </Form>
      <Message attached="bottom" warning>
        Already signed up? &nbsp; <Link to={Routes.Login}>Log in</Link> &nbsp;
        instead.
      </Message>
    </>
  );
};
