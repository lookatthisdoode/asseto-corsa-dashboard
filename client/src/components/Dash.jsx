function Dash(props) {

    const { rpms, gear, gauge, speed }  = props

    return (
        <>
        <div className="dash" style={{backgroundColor: gauge >= 95 ? 'red' : 'var(--background-color)'}}>
            <div className="dash-gear-container" >
                <div className="dash-gear-gear" >{gear}
                    <div className="dash-gear-rmps">{rpms}</div>
                </div>
                
                <div className="dash-rpm-gauge">
                    <div className="dash-gauge" style={{
                        transform: `scaleY(${gauge/100})`,
                        backgroundColor: 'var(--text-color)'
                    }}></div>
                </div>
            </div>
            <div className="dash-speed-container">
                <div className="dash-speed-number">{speed}</div>
            </div>
        </div>
        </>
    )

}

export default Dash