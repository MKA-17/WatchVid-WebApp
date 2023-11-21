import React from 'react'
import Helmet from "react-helmet";
import Navbar from "../Navbar/Navbar";
import { useHelmet } from '../../store/helmet.js';

export default function Layout({children}) {
    const {helmet} = useHelmet();
  return (
    <div>
        <Helmet>
                <meta charSet="utf-8" />
                <meta name="description" content={helmet.description} />
                <meta name="keywords" content={helmet.keywords}/>
                <meta name="author" content={helmet.author} />
                <title>{helmet.title}</title>
        </Helmet>
        <Navbar/>
        {children}

    </div>
  )
}
