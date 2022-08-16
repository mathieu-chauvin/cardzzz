import styles from '../styles/Home.module.css'
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useState } from 'react';
import {ListOffers} from './ListOffers';
import {ListReimbursments} from './ListReimbursments';

import { ShowNFTs } from './ShowNFTs';
import { StakeCard } from './StakeCard';
import DataTable from './DataTable';

export const Tabs = (props) =>  {

    const [value, setValue] = useState('1');

    const [nft, setNft] = useState(null);

    const [staked, setStaked] = useState(false);


    const handleChangeV = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChangeV} aria-label="lab API tabs example">
                    <Tab label="Borrow" value="1" />
                    <Tab label="Lend" value="2" />
                    <Tab label="Reimburse" value="3" />
                  </TabList>
                </Box>
                <TabPanel value="1">
                            
                    <ShowNFTs nft={nft} onNftChange={(nft) => setNft(nft)} />
                    {!staked && (<StakeCard nft={nft} />)}

                </TabPanel>
                <TabPanel value="2">
                    <ListOffers />
                </TabPanel>

                <TabPanel value="3">
                    <ListReimbursments/>
                </TabPanel>
               
              </TabContext>
            </Box>
    )
}