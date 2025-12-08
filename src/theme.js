import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0d9488",
      light: "#14b8a6",
      dark: "#0f766e",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#57534e",
      light: "#78716c",
      dark: "#44403c",
      contrastText: "#ffffff",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#292524",
      secondary: "#78716c",
    },
    grey: {
      50: "#fafafa",
      100: "#f5f5f4",
      200: "#e7e5e4",
      300: "#d6d3d1",
      400: "#a8a29e",
      500: "#78716c",
      600: "#57534e",
      700: "#44403c",
      800: "#292524",
      900: "#1c1917",
    },
    success: {
      main: "#22c55e",
      light: "#4ade80",
      dark: "#15803d",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#b45309",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    divider: "#e7e5e4",
  },
  typography: {
    fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: 1.3,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 600,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
    subtitle1: {
      fontSize: "0.9375rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      color: "#78716c",
    },
    body1: {
      fontSize: "0.9375rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.8125rem",
      lineHeight: 1.5,
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.5,
      color: "#78716c",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.875rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0 1px 2px rgba(0, 0, 0, 0.04)",
    "0 2px 4px rgba(0, 0, 0, 0.04)",
    "0 4px 8px rgba(0, 0, 0, 0.04)",
    "0 4px 12px rgba(0, 0, 0, 0.06)",
    "0 8px 16px rgba(0, 0, 0, 0.06)",
    "0 12px 24px rgba(0, 0, 0, 0.08)",
    "0 16px 32px rgba(0, 0, 0, 0.08)",
    "0 20px 40px rgba(0, 0, 0, 0.1)",
    "0 24px 48px rgba(0, 0, 0, 0.1)",
    ...Array(15).fill("0 24px 48px rgba(0, 0, 0, 0.1)"),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#fafafa",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 20px",
          fontWeight: 600,
          boxShadow: "none",
          transition: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0)",
          },
        },
        contained: {
          "&:hover": {
            boxShadow: "0 4px 12px rgba(13, 148, 136, 0.3)",
          },
        },
        containedPrimary: {
          background: "#0d9488",
          "&:hover": {
            background: "#0f766e",
          },
        },
        outlined: {
          borderColor: "#e7e5e4",
          color: "#44403c",
          "&:hover": {
            borderColor: "#d6d3d1",
            background: "#f5f5f4",
          },
        },
        text: {
          color: "#57534e",
          "&:hover": {
            background: "rgba(13, 148, 136, 0.08)",
          },
        },
        sizeLarge: {
          padding: "12px 28px",
          fontSize: "0.9375rem",
        },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: "0.8125rem",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "white",
            transition: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
            "& fieldset": {
              borderColor: "#e7e5e4",
              transition: "border-color 0.15s ease",
            },
            "&:hover fieldset": {
              borderColor: "#d6d3d1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0d9488",
              borderWidth: 2,
            },
          },
          "& .MuiInputLabel-root": {
            color: "#78716c",
            fontSize: "0.875rem",
            "&.Mui-focused": {
              color: "#0d9488",
            },
          },
          "& .MuiInputBase-input": {
            fontSize: "0.9375rem",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e7e5e4",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d6d3d1",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0d9488",
            borderWidth: 2,
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          "& .MuiInputLabel-root": {
            color: "#78716c",
            fontSize: "0.875rem",
            "&.Mui-focused": {
              color: "#0d9488",
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none",
          border: "1px solid #e7e5e4",
          transition: "all 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation0: {
          boxShadow: "none",
        },
        elevation1: {
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: "0.75rem",
          height: 28,
        },
        filled: {
          backgroundColor: "#f5f5f4",
          color: "#57534e",
          "&.MuiChip-colorPrimary": {
            backgroundColor: "rgba(13, 148, 136, 0.1)",
            color: "#0f766e",
          },
        },
        outlined: {
          borderColor: "#e7e5e4",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.15s ease",
          "&:hover": {
            backgroundColor: "#f5f5f4",
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#a8a29e",
          "&.Mui-checked": {
            color: "#0d9488",
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#a8a29e",
          "&.Mui-checked": {
            color: "#0d9488",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: "0.875rem",
        },
        standardError: {
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          color: "#dc2626",
        },
        standardWarning: {
          backgroundColor: "rgba(245, 158, 11, 0.08)",
          color: "#b45309",
        },
        standardSuccess: {
          backgroundColor: "rgba(34, 197, 94, 0.08)",
          color: "#15803d",
        },
        standardInfo: {
          backgroundColor: "rgba(13, 148, 136, 0.08)",
          color: "#0f766e",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          fontSize: "0.8125rem",
          "& .MuiDataGrid-cell": {
            borderBottomColor: "#f5f5f4",
            padding: "12px 16px",
            "&:focus": {
              outline: "none",
            },
            "&:focus-within": {
              outline: "none",
            },
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#fafafa",
            borderBottomColor: "#e7e5e4",
            borderBottomWidth: 1,
            "& .MuiDataGrid-columnHeader": {
              padding: "12px 16px",
              "&:focus": {
                outline: "none",
              },
              "&:focus-within": {
                outline: "none",
              },
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: "0.75rem",
              color: "#57534e",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            },
          },
          "& .MuiDataGrid-row": {
            "&:hover": {
              backgroundColor: "rgba(13, 148, 136, 0.04)",
            },
            "&.Mui-selected": {
              backgroundColor: "rgba(13, 148, 136, 0.08)",
              "&:hover": {
                backgroundColor: "rgba(13, 148, 136, 0.12)",
              },
            },
          },
          "& .MuiDataGrid-footerContainer": {
            borderTopColor: "#e7e5e4",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#292524",
          fontSize: "0.75rem",
          padding: "6px 12px",
          borderRadius: 6,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e7e5e4",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          padding: "10px 16px",
          "&:hover": {
            backgroundColor: "#f5f5f4",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(13, 148, 136, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(13, 148, 136, 0.12)",
            },
          },
        },
      },
    },
  },
});

export default theme;
