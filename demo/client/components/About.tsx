import React, { FC } from 'react';
import {
  makeStyles, createStyles, Card, CardContent, Typography,
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

const About: FC<Props> = ({
  details,
}: Props) => {
  const useStyles = makeStyles(() => createStyles({
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
    <Card className={classes.root}>
      <CardContent>
        <Typography color="textPrimary" align="center" gutterBottom>
          {details.name}
        </Typography>
        <Typography align="center">
          <a href={details.github}>
            <GitHubIcon color="primary" />
          </a>
          <a href={details.linkedIn}>
            <LinkedInIcon color="primary" />
          </a>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default About;
