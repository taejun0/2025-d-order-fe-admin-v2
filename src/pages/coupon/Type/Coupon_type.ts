export type BaseProps = {
  Title: string;
  isEssential?: boolean;
  value: string | number | "";
  onChange: (v: string) => void;
};

export type TextProps = BaseProps & {
  type: "text" | "number";
  placeholderText: string;
  name?: string;
  helperText?: string;
  hasError?: boolean;
};

export type RadioOption = { label: string; value: string };

export type RadioProps = BaseProps & {
  type: "radio";
  name: string;
  options: RadioOption[];
};

export type CouponInputProps = TextProps | RadioProps;
