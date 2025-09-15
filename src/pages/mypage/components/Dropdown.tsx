// components/Dropdown.tsx
import React from "react";
import styled from "styled-components";
import CommonDropdown from "../../signup/_components/inputs/dropdown/CommonDropdown";

export const StyledDropdown = styled(CommonDropdown)`
  div, input, button { border-radius: 5px !important; }
  select { border-radius: 5px !important; }
  option[value=""] { color: ${({ theme }) => theme.colors.Black02}; }
`;

type Props = {
  value: string;
  options: string[];
  placeholder?: string;
  isOpen: boolean;
  // ✅ 핵심 수정: 함수형 업데이트까지 허용
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Dropdown = ({ value, options, placeholder, isOpen, setIsOpen, onChange }: Props) => {
    return (
        <StyledDropdown
        label=""
        placeholder={placeholder ?? ""}
        value={value}
        onChange={onChange}
        options={options}
        radius="5px"
        isOpen={isOpen}
        setIsOpen={setIsOpen}  // ✅ 이제 타입 일치
        />
    );
};

export default Dropdown;
