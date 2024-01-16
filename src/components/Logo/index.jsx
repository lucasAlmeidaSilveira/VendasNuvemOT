// import React from "react";
import "./style.css"
import logoOutlet from "../../assets/images/logo.png"
import logoArtePropria from "../../assets/images/logoAP.svg"

// eslint-disable-next-line react/prop-types
export function Logotipo({store}) {
	return (
		<>
			<img className="logotipo" alt="Logotipo" src={store === "outlet" ? logoOutlet : logoArtePropria} />
		</>
	)
}
