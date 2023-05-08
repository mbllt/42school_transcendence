import { Box, Container, Typography } from '@mui/material';
import React from 'react';

const Error404 = () => {
	return (
		<Container sx={{
			display: "flex",
          justifyContent: "center",
          alignItems: "center",
		  textAlign: 'center',
          height: "100vh",
		}}>
			<Typography variant="h1">
				Error 404: This page does not exist.
			</Typography>
		</Container>
	);
};

export default Error404;