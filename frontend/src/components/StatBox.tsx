import React from 'react';
import { Divider, Grid, Paper, Typography, styled } from "@mui/material";

type StatBoxProps = {
	icon: any,
	string1: string,
	val1: number | string,
	string2: string,
	val2: number | string,
}

const Item = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === "dark" ? "#000000" : "#ffffff",
	...theme.typography.body2,
	padding: theme.spacing(1),
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: "#000000",
	border: 1.5,
	borderColor: "black",
  }));

const StatBox = (props : StatBoxProps) => {
	return (
		<Grid item md={4} xs={12}>
			<Item
				elevation={24}
				sx={{
				backgroundColor: "#ffffff",
				minHeight: 80,
				}}
			>
				<Typography component={"span"}>
				<Divider>
					{props.icon}
				</Divider>
					{props.string1} {props.val1}
				<br />
					{props.string2} {props.val2}
				<br />
				</Typography>
			</Item>
    	</Grid>
	);
};

export default StatBox;