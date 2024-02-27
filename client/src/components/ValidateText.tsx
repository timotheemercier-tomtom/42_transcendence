import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


export default function ValidationTextFields() {
    return (
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          <TextField
            error
            id="outlined-error"
            label="Error"
            defaultValue="Hello World"
          />
        </div>
      </Box>
    );
  }
  