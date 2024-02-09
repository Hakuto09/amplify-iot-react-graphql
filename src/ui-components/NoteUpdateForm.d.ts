/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, SelectFieldProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type NoteUpdateFormInputValues = {
    name?: string;
    description?: string;
    nickname?: string;
    date?: string;
    createdAt?: string;
    updatedAt?: string;
    send_cnt?: number;
    magx?: number;
    magy?: number;
    magz?: number;
    degree?: number;
    distance?: number;
    pres?: number;
    temp?: number;
    humi?: number;
    general_data00?: number;
    general_data01?: number;
    postType?: string;
};
export declare type NoteUpdateFormValidationValues = {
    name?: ValidationFunction<string>;
    description?: ValidationFunction<string>;
    nickname?: ValidationFunction<string>;
    date?: ValidationFunction<string>;
    createdAt?: ValidationFunction<string>;
    updatedAt?: ValidationFunction<string>;
    send_cnt?: ValidationFunction<number>;
    magx?: ValidationFunction<number>;
    magy?: ValidationFunction<number>;
    magz?: ValidationFunction<number>;
    degree?: ValidationFunction<number>;
    distance?: ValidationFunction<number>;
    pres?: ValidationFunction<number>;
    temp?: ValidationFunction<number>;
    humi?: ValidationFunction<number>;
    general_data00?: ValidationFunction<number>;
    general_data01?: ValidationFunction<number>;
    postType?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type NoteUpdateFormOverridesProps = {
    NoteUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    name?: PrimitiveOverrideProps<TextFieldProps>;
    description?: PrimitiveOverrideProps<TextFieldProps>;
    nickname?: PrimitiveOverrideProps<TextFieldProps>;
    date?: PrimitiveOverrideProps<TextFieldProps>;
    createdAt?: PrimitiveOverrideProps<TextFieldProps>;
    updatedAt?: PrimitiveOverrideProps<TextFieldProps>;
    send_cnt?: PrimitiveOverrideProps<TextFieldProps>;
    magx?: PrimitiveOverrideProps<TextFieldProps>;
    magy?: PrimitiveOverrideProps<TextFieldProps>;
    magz?: PrimitiveOverrideProps<TextFieldProps>;
    degree?: PrimitiveOverrideProps<TextFieldProps>;
    distance?: PrimitiveOverrideProps<TextFieldProps>;
    pres?: PrimitiveOverrideProps<TextFieldProps>;
    temp?: PrimitiveOverrideProps<TextFieldProps>;
    humi?: PrimitiveOverrideProps<TextFieldProps>;
    general_data00?: PrimitiveOverrideProps<TextFieldProps>;
    general_data01?: PrimitiveOverrideProps<TextFieldProps>;
    postType?: PrimitiveOverrideProps<SelectFieldProps>;
} & EscapeHatchProps;
export declare type NoteUpdateFormProps = React.PropsWithChildren<{
    overrides?: NoteUpdateFormOverridesProps | undefined | null;
} & {
    id?: {
        id: string;
        date: string;
    };
    note?: any;
    onSubmit?: (fields: NoteUpdateFormInputValues) => NoteUpdateFormInputValues;
    onSuccess?: (fields: NoteUpdateFormInputValues) => void;
    onError?: (fields: NoteUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: NoteUpdateFormInputValues) => NoteUpdateFormInputValues;
    onValidate?: NoteUpdateFormValidationValues;
} & React.CSSProperties>;
export default function NoteUpdateForm(props: NoteUpdateFormProps): React.ReactElement;
