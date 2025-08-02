import {z} from 'zod';

export const pdfUploadSchema=z.object({
    file:z
            .custom<File>((file)=>file instanceof File && file.type ==='application/pdf',{
                message:'File must be a valid PDF',
            }),
});