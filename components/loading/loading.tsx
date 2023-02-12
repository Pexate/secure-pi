import { InfinitySpin } from "react-loader-spinner";
import { useThemeContext } from "context/context";

const Loading = () => {
  const context = useThemeContext();
  return (
    <div>
      <InfinitySpin
        width="200"
        color={context.theme === "dark" ? "#ffffff" : "#232323"}
      />
    </div>
  );
};

export default Loading;
