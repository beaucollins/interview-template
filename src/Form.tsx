import styled from "styled-components";

export const Form = styled.div`
  margin: 20px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid hsla(0, 0%, 0%, 0.5);
  display: inline-flex;
`;

export const Notice = styled.div`
  padding: 10px;
  border-radius: 2px;

  &.isError {
    background: hsla(0, 50%, 50%, 0.1);
    border-color: hsla(0, 50%, 25%, 1);
  }
`;
