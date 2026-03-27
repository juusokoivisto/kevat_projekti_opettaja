import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const names = ["Juuso Koivisto", "Eetu Kiljala", "Nico Pasanen", "Jesse Keski-Korhonen"];

const Divider = () => (
  <Box component="span" sx={{ fontWeight: 300, color: "text.disabled", mx: 1 }}>
    |
  </Box>
);

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: "auto",
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600, mb: 0.5 }}>
        {names.map((name, i) => (
          <span key={name}>
            {name}
            {i < names.length - 1 && <Divider />}
          </span>
        ))}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Kevät Projekti
      </Typography>
    </Box>
  );
}