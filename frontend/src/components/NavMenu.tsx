import React from 'react';
import { Link } from 'react-router-dom';
import { LoginMenu } from '../authorization/AuthorizeNav';
import Button from '@material-ui/core/Button';

export const NavMenu = () => {
  return (
    <>
      <Button variant="contained">
        <Link className="text-dark" to="/profile">
          Profile
        </Link>
      </Button>
      <Button variant="contained">
        <Link className="text-dark" to="/authorized">
          Authorized
        </Link>
      </Button>
      <LoginMenu></LoginMenu>
    </>
  );
};
