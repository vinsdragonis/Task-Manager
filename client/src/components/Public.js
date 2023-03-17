import { Link } from "react-router-dom";
import React from 'react';

const Public = () => {
    const content = (
        <section className="public">
            <header>
                <h1>Welcome to <span className="nowrap">Task Manager!</span></h1>
            </header>
            <main className="public__main">
                <p>Owner: Dragonis</p>
            </main>
            <footer>
                <Link to="/login">Employee Login</Link>
            </footer>
        </section>
    );
    return content;
}

export default Public;