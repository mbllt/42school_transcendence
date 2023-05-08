import { Button, Dialog, DialogTitle, FormControl, Input, InputLabel, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { auth42, authenticate2fa } from '../../services/auth/AuthService';
import { useQuery } from 'react-query';
import AuthToken from '../../services/auth/AuthToken';

interface TwoFaProps {
	open: boolean,
	onClose: Function,
	setTwofa: Function,
}

const Twofa = (props: TwoFaProps) => {

	const [twofaPsw, setTwofaPsw] = useState<string>("");

	const handleClose = () => {return props.onClose;}

	const handleConnection = () => {
		props.setTwofa(twofaPsw);
	}

	return (
		<Dialog onClose={handleClose} open={props.open} fullWidth={true}>
			<DialogTitle sx={{ display: "flex", justifyContent: "center", fontWeight:"bold" }}>2FA</DialogTitle>
			<Box sx={{
				display:'flex',
				alignItems:'center',
				p:3,
			}}>
				<Typography>2FA Authentication</Typography>
				<FormControl>
					<InputLabel htmlFor="twofacode">twofacode</InputLabel>
					<Input
						required id="twofacode"
						onChange={(e) => setTwofaPsw(e.target.value)}
						onKeyDown={(e) => {if (e.key == 'Enter') handleConnection;}}
					/>
				</FormControl>
				<Button variant="contained" onClick={handleConnection}>Submit</Button>
			</Box>
		</Dialog>
	);
};

export default Twofa;