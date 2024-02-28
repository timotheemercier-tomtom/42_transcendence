import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';


export default function ValidationTextFields(value: string, error:boolean) {
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
        if (error){
            <TextField
              error
              id="outlined-error"
              label="error"
              defaultValue={value}
            />
        }else {
            <TextField id="outlined-basic" label="Outlined" variant="outlined" />
        }
        </div>
      </Box>
    );
  }
  