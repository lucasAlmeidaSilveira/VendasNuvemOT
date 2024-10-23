import React from 'react';
import { ReactElement } from "react";
import { TagContainer } from "./styles";

interface TagProps {
  children: ReactElement;
}

export function Tag({ children }: TagProps){
  return (
    <TagContainer>{children}</TagContainer>
  )
}