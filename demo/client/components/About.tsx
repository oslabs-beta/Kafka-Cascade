import React, { FC } from 'react';
import {
  makeStyles, createStyles, Card, CardContent,
  Typography, Container,
} from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';


const About: FC = () => {
  const useStyles = makeStyles(() => createStyles({
    wrapper: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    root: {
      backgroundColor: 'rgba(225, 218, 232)',
      padding: '1rem 1rem 1rem 1rem',
      margin: '5px',
      minWidth: 'md',
    },
  }));

  const classes = useStyles();

  const contributors = [
    {
      name: 'Davette Bryan',
      github: 'https://github.com/Davette-Bryan',
      linkedin: 'https://www.linkedin.com/in/davette-bryan/',
      photo: 'Davette_Bryan.jpg',
    },
    {
      name: 'Robert Du',
      github: 'https://github.com/robertcdu',
      linkedin: 'https://www.linkedin.com/in/robert--du/',
      photo: 'Robert_Du.jpg',
    },
    {
      name: 'Seung Joon Lee',
      github: 'https://github.com/GnuesJ',
      linkedin: '',
      photo: 'Cartoon_Josh.jpeg',
    },
    {
      name: 'Michael Weber',
      github: 'https://github.com/michaelweberjr',
      linkedin: 'https://www.linkedin.com/in/michael-weber-jr/',
      photo: 'Michael_Weber.png',
    },
  ];

  const contributorArray = [];

  contributors.forEach((contributor) => {
    contributorArray.push(
      <Card className={classes.root}>
        <CardContent>
          <Typography align="center">
            <img
              alt="photo"
              style={{
                height: '12vh',
                paddingBottom: '1vh',
                borderRadius: '50%',
              }}
              src={contributor.photo}
            />
            <br />
            {contributor.name}
            <br />
            <a href={contributor.github} target='_blank'>
              <GitHubIcon color="primary" />
            </a>
            <a href={contributor.linkedin} target='_blank'>
              <LinkedInIcon color="primary" />
            </a>
          </Typography>
        </CardContent>
      </Card>
    )
  });

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
      <Container className={classes.container}>
        {contributorArray}
      </Container>
    </Container>   
  );
};

export default About;
