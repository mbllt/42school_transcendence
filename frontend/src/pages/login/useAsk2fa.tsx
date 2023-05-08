import { Button, Dialog, DialogTitle, FormControl, Input, InputLabel, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useQueryClient } from 'react-query';

const useAsk2fa = (callback: (Code2fa : string) => void) => {

	const [open, setOpen] = useState<boolean>(false);
	const [twofaPsw, setTwofaPsw] = useState<string>("");

	const handleOpen = () => {return setOpen(true);}

	const handleClose = () => {return setOpen(false);}

	const handleConnection = () => {
		callback(twofaPsw);
	}


	return [
		<Dialog onClose={handleClose} open={open} fullWidth={true}>
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
						onKeyDown={(e) => {if (e.key == 'Enter') handleConnection();}}
					/>
				</FormControl>
				<Button variant="contained" onClick={handleConnection}>Submit</Button>
			</Box>
		</Dialog>,
		handleOpen,
		handleClose,
	];
};

export default useAsk2fa;