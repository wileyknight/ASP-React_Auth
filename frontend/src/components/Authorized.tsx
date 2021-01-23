import React, { useState, useEffect } from 'react';

export const Authorized = () => {
  const baseURL = `https://localhost:5001/authorization/isallowed`;

  const [isAllowed, setIsAllowed] = useState<string>('No data available');

  const getData = async () => {
    await fetch(baseURL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(async (res) => {
        const js = await res.json();
        setIsAllowed(js.authenticated);
      })
      .catch((err) => {
        console.log('error', err);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <h1>Authorized Page</h1>
      <div>{isAllowed}</div>
    </div>
  );
};
