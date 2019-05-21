{//加权版本的求解算法
for (idx = 0; idx < SIZE_DATAUSED; idx++)
{//归一化处理
	fNormSam[idx] = (float)iFullSam[idx] / (float)fAmp;
	fNormSam_2[idx] = 1.0f - fNormSam[idx] * fNormSam[idx];//余弦平方
}
PE2P_fInitPcPg(&fNormSam[iMaxIndex - 1], &fpc, &fpg, iMaxIndex - 1);

//求解arctan(NormSam)并且加减2*pi到合适的区间
for (idx = 0; idx < SIZE_DATAUSED; idx++)
{
	fInitPhase = fpc - (idx - K_DEVIATION) * fpg;
	fCosPhase = cos(fInitPhase);
	if (fCosPhase >= 0) { fPhase[idx] = atan2(fNormSam[idx], sqrt(fNormSam_2[idx])); }
	else { fPhase[idx] = atan2(fNormSam[idx], -sqrt(fNormSam_2[idx])); }
	fPhase[idx] += round((fInitPhase - fPhase[idx]) / FRAD_2D0PI) * FRAD_2D0PI;
}

//begin ************************************** 直接求解 **************************************************
//s = inv(Jmat'*W*Jmat)*Jmat'*Y
fpc = 0;
fpg = 0;
for (idx = 0; idx < SIZE_DATAUSED; idx++)
{
	fJmat[idx][0] = 1.0f;
	fJmat[idx][1] = (float)(-idx + K_DEVIATION);
}
fJsqr[0][0] = 0; for (idx = 0; idx < SIZE_DATAUSED; idx++)  fJsqr[0][0] = fJsqr[0][0] + fJmat[idx][0] * fJmat[idx][0] * fNormSam_2[idx];
fJsqr[0][1] = 0; for (idx = 0; idx < SIZE_DATAUSED; idx++)  fJsqr[0][1] = fJsqr[0][1] + fJmat[idx][0] * fJmat[idx][1] * fNormSam_2[idx];
fJsqr[1][0] = 0; for (idx = 0; idx < SIZE_DATAUSED; idx++)  fJsqr[1][0] = fJsqr[1][0] + fJmat[idx][1] * fJmat[idx][0] * fNormSam_2[idx];
fJsqr[1][1] = 0; for (idx = 0; idx < SIZE_DATAUSED; idx++)  fJsqr[1][1] = fJsqr[1][1] + fJmat[idx][1] * fJmat[idx][1] * fNormSam_2[idx];

fJdet = fJsqr[0][0] * fJsqr[1][1] - fJsqr[0][1] * fJsqr[1][0];
fJinv[0][0] = +fJsqr[1][1] / fJdet;
fJinv[0][1] = -fJsqr[0][1] / fJdet;
fJinv[1][0] = -fJsqr[1][0] / fJdet;
fJinv[1][1] = +fJsqr[0][0] / fJdet;

for (idx = 0; idx < SIZE_DATAUSED; idx++)
{
	fGain[0][idx] = fJinv[0][0] * fJmat[idx][0] + fJinv[0][1] * fJmat[idx][1];
	fGain[1][idx] = fJinv[1][0] * fJmat[idx][0] + fJinv[1][1] * fJmat[idx][1];
	fGain[0][idx] *= fNormSam_2[idx];
	fGain[1][idx] *= fNormSam_2[idx];
}
for (idx = 0; idx < SIZE_DATAUSED; idx++)
{
	fpc = fpc + fGain[0][idx] * fPhase[idx];
	fpg = fpg + fGain[1][idx] * fPhase[idx];
}
if (fpg >= +FRAD_2D0PI) fpg = fpg - FRAD_2D0PI;
if (fpg < 0) fpg = fpg + FRAD_2D0PI;
if (fpc >= +FRAD_2D0PI) fpc = fpc - FRAD_2D0PI;
if (fpc < 0) fpc = fpc + FRAD_2D0PI;
*ipc_updt = (int32)(fpc*65536.0); *ipg_updt = (int32)(fpg*65536.0);
//end **************************************** 直接求解 ***************************************
	}