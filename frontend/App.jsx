import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "./redux/store.jsx";
import Sidebar from "./components/SideBar.jsx";
import CircularButton from "./components/CircularButton.jsx";
import { PESU_SESSION_EXPIRED_KEY } from "../src/helpers/pesuAPI.js";
import theme from "./Themes/theme.jsx";

const App = () => {
    const [sessionExpired, setSessionExpired] = useState(false);

    useEffect(() => {
        chrome.storage.local.get(PESU_SESSION_EXPIRED_KEY, (result) => {
            setSessionExpired(result[PESU_SESSION_EXPIRED_KEY] === true);
        });

        const listener = (changes, areaName) => {
            if (areaName === "local" && changes[PESU_SESSION_EXPIRED_KEY]) {
                setSessionExpired(changes[PESU_SESSION_EXPIRED_KEY].newValue === true);
            }
        };

        chrome.storage.onChanged.addListener(listener);
        return () => chrome.storage.onChanged.removeListener(listener);
    }, []);

    const reloadPage = () => {
        chrome.storage.local.remove(PESU_SESSION_EXPIRED_KEY, () => {
            window.location.reload();
        });
    };

    return ( 
        <Provider store={store}>
            <CircularButton/>
            <Sidebar/>
            <Dialog
                open={sessionExpired}
                disableEscapeKeyDown
                PaperProps={{
                    sx: {
                        border: `1px solid ${theme.colors.secondaryLight}`,
                        borderRadius: '12px'
                    }
                }}
            >
                <DialogTitle sx={{ color: theme.colors.secondary, fontWeight: 700 }}>
                    Session expired
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: theme.colors.secondary }}>
                        Your PESU Academy session has expired. Reload the page and log in again if prompted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ backgroundColor: theme.colors.secondaryLight }}>
                    <Button
                        variant="contained"
                        onClick={reloadPage}
                        sx={{
                            backgroundColor: theme.colors.primary,
                            textTransform: 'none',
                            '&:hover': { backgroundColor: theme.colors.primaryHover }
                        }}
                    >
                        Reload page
                    </Button>
                </DialogActions>
            </Dialog>
        </Provider>
     );
}
 
export default App;
