import { Oval } from "react-loader-spinner"
import { ContainerLoading } from "./styles"

// eslint-disable-next-line react/prop-types
export function Loading({ color }) {
	return (
		<ContainerLoading>
      Carregando...
			<Oval
				height={32}
				width={32}
				color={color}
				wrapperStyle={{}}
				wrapperClass=""
				visible={true}
				ariaLabel='oval-loading'
				secondaryColor={color}
				strokeWidth={4}
				strokeWidthSecondary={4}
			/>
		</ContainerLoading>
	)
}
