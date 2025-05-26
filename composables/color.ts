export const useColor = () => {
  const topColor = useState("topColor", () => "#ff00f7");
  const bottomColor = useState("bottomColor", () => "#FF6600");

  const setTopColor = (color: string) => {
    topColor.value = color;
  };

  const setBottomColor = (color: string) => {
    bottomColor.value = color;
  };

  return {
    topColor,
    bottomColor,
    setTopColor,
    setBottomColor,
  };
};
