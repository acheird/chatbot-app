import Head from "next/head";

export default function ProfilePage() {
    return (
        <>
            <Head>
                <title>User Profile</title>
            </Head>
            <div className="page-container">
                <header>
                    <div className="header-content">
                        <div className="header-brand">
                            <img src="/ai.png" alt="Logo" className="header-logo" />
                            <div className="header-title">Chat Application</div>
                        </div>
                    </div>
                </header>
                <div className="content">
                    <div className="account-settings">
                        <h1>User Profile</h1>
                        <p>This is your profile page. Add your user info here.</p>
                    </div>
                </div>
                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}
