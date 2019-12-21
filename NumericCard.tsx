/** @jsx jsx */

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { jsx, css, SerializedStyles } from '@emotion/core';
import grey from '@material-ui/core/colors/grey';

const valueCss = css``;

const unitCss = css`
    align-self: flex-start;
    color: ${grey[500]};
`;

interface INumericCardProps {
    value?: string | number;
    unit?: string;
    rootCss?: SerializedStyles;
}

export default function NumericCard({ value, unit, rootCss }: INumericCardProps) {
    return (
        <Card>
            <CardContent css={rootCss}>
                <Typography css={valueCss} variant="h2">
                    { value }
                </Typography>
                {
                    unit && (
                        <Typography css={unitCss} variant="h5">
                            { unit }
                        </Typography>
                    )
                }
            </CardContent>
        </Card>
    );
}