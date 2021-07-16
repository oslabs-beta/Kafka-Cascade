import React, { FC } from 'react';
import {
  makeStyles, createStyles, Card, CardContent,
  Typography, Container,
} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';

interface Props {
 details: {
    name: string,
    linkedIn: string,
    github: string,
  }
}

const About: FC<Props> = ({ details }: Props) => {
  const useStyles = makeStyles(() => createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyItems: 'center',
      alignItems: 'center',
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'space-between',
      marginTop: '3vh',
      backgroundColor: 'rgba(225, 218, 232)',
      paddingTop: '2vh',
      paddingBottom: '2vh',
      width: 'auto',
    },
    root: {
      display: 'flex',
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
      padding: '1rem 1rem 1rem 1rem',
      margin: '0rem 2rem 2rem 2rem',
      minWidth: '15vw',
      maxWidth: '15vw',
    },
  }));

  const classes = useStyles();

  return (
    <Container className={classes.wrapper}>
      <Typography 
        variant="h4"
        color="textPrimary"
        align="center"
        gutterBottom
      >
        About
      </Typography>
    </Container>   
  );
};

export default About;
