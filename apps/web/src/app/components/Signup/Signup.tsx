import { useMutation } from '@apollo/client';
import { parse } from 'query-string';
import React, { useContext, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Segment, Button, Message } from 'semantic-ui-react';

import {
  SignupMutation,
  SignupMutationVariables,
} from '../../../generated/generated';
import { loginAndGetToken } from '../../../utils/auth';
import { Routes } from '../../../utils/constants';
import { extractGraphqlErrorMessage } from '../../../utils/error';
import { firebaseAnalytics } from '../../../utils/firebase';
import { SessionContext } from '../../context';

import SIGNUP_MUTATION from './Signup.graphql';

export const Signup = () => {
  const { setToken } = useContext(SessionContext);
  const [loginLoading, setLoginLoading] = useState(false);
  const [formData, setFormData] = useState<{
    email?: string;
    password?: string;
    invitationCode?: string;
  }>({});

  const [signup, { data, loading, error }] = useMutation<
    SignupMutation,
    SignupMutationVariables
  >(SIGNUP_MUTATION);

  const handleSignup = useCallback(async () => {
    const emailRe = /\S+@\S+\.\S+/;
    if (
      formData.email &&
      formData.password &&
      formData.invitationCode &&
      emailRe.exec(formData.email)
    ) {
      firebaseAnalytics.logEvent('sign_up', {
        email: formData.email,
      });
      signup({
        variables: {
          email: formData.email,
          password: formData.password,
          invitationCode: formData.invitationCode,
        },
      });
    }
  }, [formData, signup]);

  useEffect(() => {
    const urlQuery = window.location.hash.replace(`#${Routes.Signup}`, '');
    const parsedUrlQuery = parse(urlQuery);
    if (parsedUrlQuery.email && parsedUrlQuery.invitationCode) {
      setFormData({
        email: parsedUrlQuery.email as string,
        invitationCode: parsedUrlQuery.invitationCode as string,
      });
    }
  }, []);

  useEffect(() => {
    async function loginAndSetToken() {
      setLoginLoading(true);
      const token = await loginAndGetToken(formData.email, formData.password);
      setLoginLoading(false);
      setToken(token);
    }
    if (data?.signup?.uid) {
      loginAndSetToken();
    }
  }, [data, formData, setLoginLoading, setToken]);

  return (
    <>
      <Message attached info>
        We are still in beta now, leave your email &nbsp;
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://eleven-voucher.typeform.com/to/Ooi5qA"
          onClick={() => {
            firebaseAnalytics.logEvent('generate_lead', {});
          }}
        >
          <b>HERE</b>
        </a>
        &nbsp; so we can send you an invitation code.
      </Message>
      <Form
        onSubmit={handleSignup}
        size="large"
        loading={loading || loginLoading}
      >
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
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            fluid
          />
          <Form.Input
            name="password"
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={e =>
              setFormData({ ...formData, password: e.target.value })
            }
            fluid
          />
          <Form.Input
            name="invitationCode"
            icon="slack"
            iconPosition="left"
            placeholder="Invitation code"
            autoComplete="off"
            value={formData.invitationCode}
            onChange={e =>
              setFormData({ ...formData, invitationCode: e.target.value })
            }
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
