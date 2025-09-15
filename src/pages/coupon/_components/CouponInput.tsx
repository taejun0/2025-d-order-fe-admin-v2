import * as S from "./Coupon.styled";
import { memo } from "react";
import { CouponInputProps } from "../Type/Coupon_type";

export const CouponInput = memo((props: CouponInputProps) => {
  const { Title, isEssential = true } = props;

  return (
    <S.ele>
      <S.SubTitle>
        {Title}
        {isEssential && <span>*</span>}
      </S.SubTitle>

      {props.type === "radio" ? (
        <div>
          {props.options.map((opt, i) => {
            return (
              <S.RadioLabel key={opt.value}>
                <input
                  type="radio"
                  name={props.name}
                  value={opt.value}
                  checked={props.value === opt.value}
                  onChange={() => props.onChange?.(opt.value)}
                  required={isEssential && i === 0}
                />
                {opt.label}
              </S.RadioLabel>
            );
          })}
        </div>
      ) : (
        <>
          <S.inputText
            type={props.type}
            name={props.name}
            placeholder={props.placeholderText}
            maxLength={20}
            value={props.value ?? ""}
            onChange={(e) => props.onChange?.(e.target.value)}
            $hasError={props.hasError}
          />
          {props.helperText && (
            <S.WarningText>{props.helperText}</S.WarningText>
          )}
        </>
      )}
    </S.ele>
  );
});
