function LoginPage(props) {

    const {connectToAc} = props
    return (
        <div className="login">
            <div className="login-container">
                <div className="login-title">Enter your IP address </div>
                <input className="login-ip-form" type="text" defaultValue='192.168.31.162'/>
                <div className="login-connect-button" onClick={ () => connectToAc() }>Connect</div>
            </div>
        </div>
    )

}

export default LoginPage