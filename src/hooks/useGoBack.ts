import { useRouter } from "next/navigation";

const useGoBack = () => {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back(); // Navegar a la ruta anterior
    } else {
      router.push("/"); // Redirigir a la página de inicio si no existe historial
    }
  };

  return goBack;
};

export default useGoBack;
