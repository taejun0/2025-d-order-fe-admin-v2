import { useRef, useState } from 'react';
import * as S from './CommonDropdown.styled';
import { SIGNUP_CONSTANTS } from '@pages/signup/_constants/signupConstants';

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: string[];
  radius?: string;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  optionLabelMap?: Record<string, string>;
};

const CommonDropdown = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  radius,
  isOpen: controlledIsOpen,
  setIsOpen: setControlledIsOpen,
  optionLabelMap,
}: Props) => {
  const isControlled =
    controlledIsOpen !== undefined && setControlledIsOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = isControlled ? controlledIsOpen : uncontrolledOpen;
  const setIsOpen = isControlled ? setControlledIsOpen : setUncontrolledOpen;

  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (selected: string) => {
    const fakeEvent = {
      target: { value: selected },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(fakeEvent);
    setIsOpen(false);
  };

  return (
    <S.Wrapper>
      <S.Label>{label}</S.Label>
      <S.CustomBox
        $isOpen={isOpen}
        $radius={radius}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <input
          type="text"
          ref={inputRef}
          readOnly
          value={optionLabelMap?.[value] ?? value}
          placeholder={placeholder}
          onBlur={() => setTimeout(() => setIsOpen(false), 100)}
        />
        <S.ArrowIcon
          src={SIGNUP_CONSTANTS.INPUT_IMAGE.UP}
          alt="화살표"
          $isOpen={isOpen}
        />
      </S.CustomBox>
      {isOpen && (
        <S.OptionList>
          {options.map((opt) => (
            <S.Option key={opt} onMouseDown={() => handleSelect(opt)}>
              {optionLabelMap?.[opt] ?? opt}
            </S.Option>
          ))}
        </S.OptionList>
      )}
    </S.Wrapper>
  );
};

export default CommonDropdown;
