import Head from "next/head";

export default function SettingsPage() {
    return (
        <>
            <Head>
                <title>Settings</title>
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
                        <h1>Settings</h1>
                        <p>This is the settings page. Add user settings controls here.</p>
                    </div>
                </div>
                <footer>© 2025 Chat App, Inc.</footer>
            </div>
        </>
    );
}
