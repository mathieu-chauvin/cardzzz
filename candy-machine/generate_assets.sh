rm assets/*
for i in {0..199}
do
	printf '{
  "name": "SolCredit cards",
  "symbol": "SCC",
  "description": "They are cards to make loans",
  "seller_fee_basis_points": 500,
  "image": "%s.png",
  "external_url": "https://twitter.com/math78C",
  "attributes": [
    {
      "value": "Bronze",
      "trait_type": "COLOR"
    },
    {
      "value": "0",
      "trait_type": "SCORE"
    }
  ],
  "collection": {
    "name": "SolCredit cards",
    "family": "Solana Financial NFTs by Cypher"
  },
  "properties": {
    "files": [
      {
        "uri": "%s.png",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "share": 100,
        "address": "KMcyC5nELGSwnhRwmNmoE3Nx1HkXyJENSC44vDG3frg"
      }
    ]
  }
}' $i $i> ./assets/$i.json
	cp ./pictures/bronze.png ./assets/$i.png
done
