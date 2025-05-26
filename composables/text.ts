export const useText = () => {
  const text = useState("text", () => "human");
  const setText = (newText: string) => {
    text.value = newText;
  };
  return {
    text,
    setText,
  };
};
