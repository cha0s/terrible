import PropTypes from 'prop-types';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import './root.css';
import locals from './root.module.css';

import FluidTextInitializer from './fluid-text/initializer';
import NumberInitializer from './routes/play.$gameKey/bar/timeout/number-initializer';

export function Layout({children}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={locals.terrible}>
        <FluidTextInitializer />
        <NumberInitializer />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};

export default function App() {
  return <Outlet />;
}
