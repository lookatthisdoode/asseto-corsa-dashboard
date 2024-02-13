function Laps(props) {

    const { currentLap, bestLap } = props
    return (
        <>
            <div className="laps">
                <div className="laps-container">
                    <div className="laps-title">Current</div>
                    <div className="laps-meter">{currentLap}</div>
                    <div className="laps-title">Best</div>
                    <div className="laps-meter">{bestLap}</div>

                </div>
            </div>
        </>
    )

}

export default Laps