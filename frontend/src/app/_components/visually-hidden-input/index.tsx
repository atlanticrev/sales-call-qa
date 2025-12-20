import { forwardRef } from 'react';

import styles from './styles.module.scss';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const VisuallyHiddenInput = forwardRef<HTMLInputElement, Props>(
    (props, ref) => {
        return (
            <input
                ref={ref}
                type="file"
                className={styles.visuallyHidden}
                {...props}
            />
        );
    }
);

VisuallyHiddenInput.displayName = 'VisuallyHiddenInput';
