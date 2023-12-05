// import { GETlistProducts } from "../../api/get.js";
import "./style.css";
import { IoReloadCircleSharp } from "react-icons/io5"

export function ButtonReload() {

  // const handleReload = async () => {
  //   try {
  //     const productList = await GETlistProducts();
  //     console.log(productList); // Faça algo com os dados recuperados, como definir no estado ou usá-los de alguma outra forma
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleReload = () => {
    window.location.reload() // Esta linha recarrega a página
  };

  return (
    <button className="boxReload" onClick={handleReload}>
      <IoReloadCircleSharp color="#FCFAFB" fontSize='40' alt="Recarregar página" />
    </button>
  )
}
