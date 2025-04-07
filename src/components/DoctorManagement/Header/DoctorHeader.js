import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const DoctorHeader = ({ onAddNew }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
      <Typography variant="h5">Doctor Management</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onAddNew}
      >
        Add New Doctor
      </Button>
    </Box>
  );
};

export default DoctorHeader;
