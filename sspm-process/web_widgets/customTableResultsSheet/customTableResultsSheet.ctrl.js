function PbTableCtrl($scope) {
    
    const toDataURL = url => fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }))

    let data;
    
    toDataURL('https://unl.edu.ec/sites/default/files/inline-images/logogris.png')
      .then(dataUrl => {
        data = dataUrl;
      })
    
    $scope.downloadPDF = function() {
        
        const allContent = [];
        
        let row = [];
        
        $scope.properties.headers.forEach((element,index) => {
            const object = {text: element, alignment: 'center', style: {bold: true, fontSize: 13,color: 'black'}}
            row.push(object);
        });
    
        allContent.push(row);
        
        $scope.properties.content.forEach(element => {
            
           row = [];
            
          for (let key in element) {
            if(!element[key].includes('object:'))  {
                console.log(key);
                if(key !== 'attribute0') {
                    const object = {text: element[key], alignment: 'center' }
                    row.push(object);
                }else {
                    row.push(element[key]);
                }
            }
          }
          
          allContent.push(row);
        })
        
        const denominationSheet =  $scope.properties.sheetDenomination.toLowerCase().includes('mitad') ? 'MITAD ' : 'FINAL ';    
        
        let percentageTable = {};
        
        if(denominationSheet === 'FINAL '){
            
            const percentageValues = ['', '100 a 91', '90 a 81', '80 a 71', '70 a 61', 'Menos del 60'];
            
            const percentageAnswers = ['Porcentaje alcanzado en el cumplimiento de la ejecución del sílabo'];
            
            percentageValues.forEach((currentPercentage,index) => {
               
               if(index > 0) {
                   
                   console.log(currentPercentage, 'Current Percentage');
                   console.log($scope.properties.percentageAchieved, 'Percentage Achieved');
                   
                   if(currentPercentage === $scope.properties.percentageAchieved.trim()){
                       percentageAnswers.push({text: 'X' , alignment: 'center', style: {bold: true, fontSize: 13,color: 'black'}});
                   } else {
                       percentageAnswers.push(' ');
                   }
               }
            });
            
            percentageTable = {
                  table: {
                    widths: [ 167, 62, 62, 62, 62, 80 ],
                    style: 'tablePercentage',  
                    body: [
                        percentageValues,
                        percentageAnswers
                    ],
                  }
                }
        }
    
            
        const docDefinition = {
            pageMargins: [40, 110, 40, 60],
            header: {
                margin: [40, 20],
                columns: [
                    {
                        // usually you would use a dataUri instead of the name for client-side printing
                        // sampleImage.jpg however works inside playground so you can play with it
                        image: data,
                        width: 240,
                        height: 70
                    },
                    {
                        style: 'header',
                        alignment: 'center',   
                        margin: [0, 20, 0, 0],
                        text: 'Seguimiento al sílabo y Plan de mejoras'
                    }
                ]
            },
            content: [
                {text: 'UNIVERSIDAD NACIONAL DE LOJA', style: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }, alignment: 'center' },
                {text: 'FACULTAD DE LA ENERGÍA, LAS INDUSTRIAS Y LOS RECURSOS NATURALES NO RENOVABLES', style : { fontSize: 12, bold: true, margin: [0, 0, 0, 10] }, alignment: 'center'},
                {text: `CARRERA DE ${$scope.properties.degree.toUpperCase()}`, style : { fontSize: 12, bold: true, margin: [0, 0, 0, 10] }, alignment: 'center'},
                {text: `PERÍODO ACADÉMICO ${$scope.properties.initDate + ' '  }  hasta ${$scope.properties.endDate}`, style : { fontSize: 12, bold: true, margin: [0, 0, 0, 10] }, alignment: 'center'},
                {text: 'FICHA DE SEGUIMIENTO DEL SÍLABO POR PARTE DE LOS ESTUDIANTES',  style : { fontSize: 12, bold: true, margin: [0, 0, 0, 10] }, alignment: 'center' },
                {text: `APLICACIÓN A  ${denominationSheet} DEL PERÍODO ACADÉMICO`, style : { fontSize: 12, bold: true, margin: [0, 0, 0, 10] }, alignment: 'center' },
                {text: 'I. DATOS INFORMATIVOS:', style : 'subheader' },
                {   
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: [ 200, 328 ],
                        body: [
                            ['Denominación del sílabo', $scope.properties.syllabusDenomination ],
                            ['Apellidos y nombres del docente', $scope.properties.teacher ],
                            ['Módulo/Ciclo:', $scope.properties.cicle  ],
                            ['Fecha de aplicación: ', $scope.properties.executionDate ],
                        ],
                    }
                },
                {text: 'II.- CUESTIONARIO', style : 'subheader'},
                {
                  table: {
                    headerRows: 1,
                    widths: [ 360, 50, 50, 50 ],
                    body: allContent,
                  }
                }
            ],
        	styles: {
        		header: {
        			fontSize: 18,
        			bold: true
        		},
        		subheader: {
        			fontSize: 12,
        			bold: true,
        			margin: [0, 10, 0, 5]
        		},
    			subheaderPercentage: {
        			fontSize: 12,
        			bold: true,
        			margin: [0, 40, 0, 5]
        		},
        		tableExample: {
        			margin: [0, 5, 0, 15]
        		},
        		tablePercentage: {
        		  margin: [0, 20]  
        		},
        		tableHeader: {
        			bold: true,
        			fontSize: 13,
        			color: 'black'
        		},
        		image: {
        		    margin: [50, 10]
        		}
    	},
        };
        if(denominationSheet === 'FINAL '){
            docDefinition.content.push({text: 'PORCENTAJE ALCANZADO:', style : 'subheaderPercentage' });
            docDefinition.content.push(percentageTable);
        }
        pdfMake.createPdf(docDefinition).open();   
    };
    
  this.isArray = Array.isArray;

  this.isClickable = function () {
    return $scope.properties.isBound('selectedRow');
  };

  this.selectRow = function (row) {
    if (this.isClickable()) {
      $scope.properties.selectedRow = row;
    }
  };

  this.isSelected = function(row) {
    return angular.equals(row, $scope.properties.selectedRow);
  }
}
